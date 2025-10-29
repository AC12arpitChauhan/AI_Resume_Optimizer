const Diff = require('diff');

/**
 * Generate line-by-line and word-by-word diffs between two texts
 */
function generateDiff(originalText, optimizedText) {
  // Line diff for structure
  const lineDiff = Diff.diffLines(originalText, optimizedText);

  // Word diff for detailed changes
  const wordDiff = Diff.diffWords(originalText, optimizedText);

  // Format diffs for UI consumption
  const formattedLineDiff = lineDiff.map((part) => ({
    value: part.value,
    added: part.added || false,
    removed: part.removed || false,
    count: part.count,
  }));

  const formattedWordDiff = wordDiff.map((part) => ({
    value: part.value,
    added: part.added || false,
    removed: part.removed || false,
    count: part.count,
  }));

  return {
    lineDiff: formattedLineDiff,
    wordDiff: formattedWordDiff,
  };
}

/**
 * Generate statistics about changes
 */
function getDiffStats(lineDiff) {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  lineDiff.forEach((part) => {
    const lineCount = (part.value.match(/\n/g) || []).length || 1;
    if (part.added) {
      additions += lineCount;
    } else if (part.removed) {
      deletions += lineCount;
    } else {
      unchanged += lineCount;
    }
  });

  return {
    additions,
    deletions,
    unchanged,
    total: additions + deletions + unchanged,
  };
}

module.exports = {
  generateDiff,
  getDiffStats,
};
