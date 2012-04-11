/// make sure that require.main protects undefined things

if (require.main === module) {
    // this is invalid on purpose
    // it will not be run for initial interpretation
    // syntax checking will still occur
    undefined_symbol();
}

