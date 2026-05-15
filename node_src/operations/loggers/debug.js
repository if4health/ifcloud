function debug(label, value = null) {
    if (value !== null) {
        process.stderr.write(`[DEBUG] ${label}: ${value}\n`);
    } else {
        process.stderr.write(`[DEBUG] ${label}\n`);
    }
}

module.exports = { debug };