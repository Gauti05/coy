async function runSeed() {
  const { getCollectionCounts, reseedDatabase } = await import("@/lib/seed");

  console.log("Seeding Coy database…");
  await reseedDatabase();
  const counts = await getCollectionCounts();

  console.log("Seed complete.");
  console.log(`  profiles:      ${counts.profiles}`);
  console.log(`  incomingLikes: ${counts.incomingLikes}`);
  console.log(`  swipes:        ${counts.swipes}`);
  console.log(`  matches:       ${counts.matches}`);

  process.exit(0);
}

runSeed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
