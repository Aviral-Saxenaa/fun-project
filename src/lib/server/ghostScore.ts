export function calculateGhostScore(
    ghostReports: number,
    totalReports: number,
    totalUpvotes: number,
    uniqueReporters: number,
): number {
    if (totalReports === 0) return 0;

    const minSample = 5;
    const confidence = totalReports < minSample ? totalReports / minSample : 1;
    const ghostRatio = ghostReports / totalReports;
    const voteFactor = Math.min(totalUpvotes / Math.max(totalReports, 1), 3) / 3;
    const uniqueness = Math.min(uniqueReporters / Math.max(totalReports, 1), 1);

    const raw = (ghostRatio * 0.5 + voteFactor * 0.3 + uniqueness * 0.2) * 100;
    const score = raw * confidence;

    const bayesianMean = 40;
    const bayesianWeight = 3;
    const smoothed =
        (score * totalReports + bayesianMean * bayesianWeight) / (totalReports + bayesianWeight);

    return Math.max(0, Math.min(100, Math.round(smoothed)));
}

export function getGhostLabel(score: number): string {
    if (score <= 20) return "Surprisingly Responsive";
    if (score <= 40) return "Mostly Responsive";
    if (score <= 60) return "Could Be Better";
    if (score <= 80) return "Getting Ghosty";
    return "Professional Ghost";
}

export function getGhostEmoji(score: number): string {
    if (score <= 20) return "👼";
    if (score <= 40) return "🙂";
    if (score <= 60) return "😐";
    if (score <= 80) return "👻";
    return "💀";
}
