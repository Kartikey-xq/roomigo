import net from "net";
import dns from "dns";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import dotenv from "dotenv";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function verifyNeon() {
  const envFile = fs.existsSync(".env.neon")
    ? ".env.neon"
    : fs.existsSync(".env.production")
    ? ".env.production"
    : ".env";

  const envConfig = dotenv.parse(fs.readFileSync(envFile));
  const rawUrl = envConfig.DIRECT_URL || envConfig.DATABASE_URL_UNPOOLED || envConfig.DATABASE_URL;

  if (!rawUrl) {
    console.error("❌ No Neon DATABASE_URL or DIRECT_URL found in env files.");
    process.exit(1);
  }

  const parsed = new URL(rawUrl);
  const targetHost = parsed.hostname;
  const endpointId = targetHost.split(".")[0];

  console.log(`Connecting to Neon project host: ${targetHost}...`);

  // Resolve target host via public DNS
  const addrs = await new Promise<string[]>((resolve, reject) => {
    dns.resolve4(targetHost, (err, addresses) => {
      if (err) return reject(err);
      resolve(addresses);
    });
  });

  const targetIp = addrs[0];

  // Set up local TCP proxy for environments where local resolver cannot route SNI / external domains directly
  const proxyPort = 5442;
  const proxy = net.createServer((clientSocket) => {
    const upstream = net.connect(5432, targetIp, () => {
      clientSocket.pipe(upstream);
      upstream.pipe(clientSocket);
    });
    upstream.on("error", (e) => clientSocket.destroy(e));
    clientSocket.on("error", (e) => upstream.destroy(e));
  });

  await new Promise<void>((resolve) => proxy.listen(proxyPort, "127.0.0.1", () => resolve()));

  const proxyUrl = `postgresql://${parsed.username}:${parsed.password}@127.0.0.1:${proxyPort}${parsed.pathname}?sslmode=require&options=endpoint%3D${endpointId}`;

  const prisma = new PrismaClient({
    datasources: { db: { url: proxyUrl } },
  });

  try {
    interface TableRow {
      table_name: string;
    }
    const tables = (await prisma.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    )) as TableRow[];

    const tableNames: string[] = tables.map((t) => t.table_name);
    console.log(`✅ Neon Connection Successful!`);
    console.log(`Found ${tableNames.length} tables in Neon schema:`);
    console.log(tableNames.join(", "));

    const [userCount, listingCount, convoCount, ticketCount] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.conversation.count(),
      prisma.webSocketTicket.count(),
    ]);

    console.log(`\nNeon Database Record Verification:`);
    console.log(`- Users: ${userCount}`);
    console.log(`- Listings: ${listingCount}`);
    console.log(`- Conversations: ${convoCount}`);
    console.log(`- WebSocket Tickets: ${ticketCount}`);
    console.log(`\n🎉 Verification Completed Successfully!`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("❌ Failed to query Neon:", errorMsg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    proxy.close();
  }
}

verifyNeon();
