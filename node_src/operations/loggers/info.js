function info(label, value = null) {
    if (value !== null) {
        process.stderr.write(`[INFO] ${label}: ${value}\n`);
    } else {
        process.stderr.write(`[INFO] ${label}\n`);
    }
}

module.exports = { info };