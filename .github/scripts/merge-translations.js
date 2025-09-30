#!/usr/bin/env node

/**
 * Merges translated keys into the Bulgarian translation file.
 * Reads translations from stdin (JSON format) and updates lang/main-bg.json.
 */

const fs = require('fs');
const path = require('path');

/**
 * Reads JSON from stdin.
 *
 * @returns {Promise<Object>} Parsed JSON object.
 */
function readStdin() {
    return new Promise((resolve, reject) => {
        let data = '';

        process.stdin.on('data', chunk => {
            data += chunk;
        });

        process.stdin.on('end', () => {
            try {
                resolve(JSON.parse(data));
            } catch (error) {
                reject(new Error('Failed to parse JSON from stdin: ' + error.message));
            }
        });

        process.stdin.on('error', reject);
    });
}

/**
 * Reads and parses a JSON file.
 *
 * @param {string} filePath - Path to the JSON file.
 * @returns {Object} Parsed JSON object.
 */
function readJsonFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(content);
}

/**
 * Writes a JSON object to a file with proper formatting.
 *
 * @param {string} filePath - Path to the JSON file.
 * @param {Object} data - Data to write.
 */
function writeJsonFile(filePath, data) {
    const fullPath = path.join(process.cwd(), filePath);

    // Sort keys alphabetically.
    const sortedData = Object.keys(data)
        .sort()
        .reduce((obj, key) => {
            obj[key] = data[key];
            return obj;
        }, {});

    const content = JSON.stringify(sortedData, null, 4) + '\n';
    fs.writeFileSync(fullPath, content, 'utf-8');
}

/**
 * Main function.
 */
async function main() {
    try {
        // Read data from stdin (contains both translations and removed keys).
        const data = await readStdin();

        if (!data) {
            console.error('No data provided');
            process.exit(1);
        }

        const { translations = {}, removed = [] } = data;

        console.error(`Received ${Object.keys(translations).length} translation(s) and ${removed.length} key(s) to remove`);

        // Read existing Bulgarian translations.
        const bulgarianTranslations = readJsonFile('lang/main-bg.json');

        // Remove deleted keys.
        let removedCount = 0;
        for (const key of removed) {
            if (key in bulgarianTranslations) {
                delete bulgarianTranslations[key];
                removedCount++;
                console.error(`✓ Removed "${key}"`);
            }
        }

        // Merge new translations.
        let updatedCount = 0;
        for (const [key, value] of Object.entries(translations)) {
            bulgarianTranslations[key] = value;
            updatedCount++;
            console.error(`✓ Updated "${key}"`);
        }

        // Write back to file (with alphabetical sorting).
        writeJsonFile('lang/main-bg.json', bulgarianTranslations);

        console.error(`✅ Successfully merged ${updatedCount} translation(s) and removed ${removedCount} key(s) from lang/main-bg.json`);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

main();