export const fetchWithRetry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        console.warn(`Attempt ${attempt} failed.`);
        if (attempt < retries) {
          await new Promise(res => setTimeout(res, 500)); // Optional delay between retries
        }
      }
    }
    throw lastError;
  };