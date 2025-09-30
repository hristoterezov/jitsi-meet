#!/usr/bin/env node

/**
 * Extracts changed keys from git diff of lang/main.json.
 * Outputs a JSON object with the changed keys and their English values.
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Gets the git diff for main.json between HEAD~1 and HEAD.
 *
 * @returns {string} The git diff output.
 */
function getMainJsonDiff() {
    try {
        return execSync('git diff HEAD~1 HEAD -- lang/main.json', {
            encoding: 'utf-8'
        });
    } catch (error) {
        console.error('Error getting git diff:', error.message);
        process.exit(1);
    }
}

/**
 * Extracts changed and removed keys from the git diff.
 *
 * @param {string} diff - Git diff output.
 * @returns {Object} Object with 'added' (keys to translate) and 'removed' (keys to delete).
 */
function extractChangedKeys(diff) {
    const added = {};
    const removed = [];
    const lines = diff.split('\n');

    for (const line of lines) {
        // Look for added or modified lines (starting with +).
        if (line.startsWith('+') && !line.startsWith('+++')) {
            const match = line.match(/^\+\s*"([^"]+)":\s*"(.*)"/);
            if (match) {
                const [, key, value] = match;

                // Remove trailing comma if present.
                const cleanValue = value.replace(/",?\s*$/, '');
                added[key] = cleanValue;
            }
        }
        // Look for removed lines (starting with -).
        else if (line.startsWith('-') && !line.startsWith('---')) {
            const match = line.match(/^\-\s*"([^"]+)":\s*"(.*)"/);
            if (match) {
                const [, key] = match;
                removed.push(key);
            }
        }
    }

    return { added, removed };
}

/**
 * Main function.
 */
function main() {
    const diff = getMainJsonDiff();

    if (!diff || diff.trim() === '') {
        console.error('No changes detected in lang/main.json');
        process.exit(0);
    }

    const { added, removed } = extractChangedKeys(diff);

    if (Object.keys(added).length === 0 && removed.length === 0) {
        console.error('No translatable changes detected');
        process.exit(0);
    }

    // Output JSON to stdout.
    console.log(JSON.stringify({ added, removed }, null, 2));
}

main();