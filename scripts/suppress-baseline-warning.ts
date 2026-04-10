const originalWarn = console.warn.bind(console);

console.warn = (...args: unknown[]) => {
  const [firstArg] = args;

  if (
    typeof firstArg === "string" &&
    firstArg.startsWith("[baseline-browser-mapping]")
  ) {
    return;
  }

  originalWarn(...args);
};
