async function runReset() {
  if (process.env.NODE_ENV === "production") {
    console.error("Refusing to run reset while NODE_ENV=production.");
    process.exit(1);
  }

  const { getCollectionCounts, reseedDatabase } = await import("@/lib/seed");

  console.log("Resetting Coy demo data (swipes/matches cleared, profiles reseeded)…");
  await reseedDatabase();
  const counts = await getCollectionCounts();

  console.log("Reset complete.");
  console.log(`  profiles:      ${counts.profiles}`);
  console.log(`  incomingLikes: ${counts.incomingLikes}`);
  console.log(`  swipes:        ${counts.swipes}`);
  console.log(`  matches:       ${counts.matches}`);

  process.exit(0);
}

runReset().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
