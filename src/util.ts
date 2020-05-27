const withTimeRecorder = (
  message: string,
  callback: (...args: any[]) => Promise<void>,
) => async (...args: any[]) => {
  const startTime = process.hrtime();

  try {
    return await callback(...args);
  } finally {
    const hrtime = process.hrtime(startTime);
    const timeTaken = hrtime[0] + hrtime[1] / 1e9;

    console.info(`${process.pid} - ${message}`, { timeTaken });
  }
};

export { withTimeRecorder };
