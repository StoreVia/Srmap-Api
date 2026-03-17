export const callApiWithRetry = async (apiCall: () => Promise<any>, maxAttempts: number = 3) => {
    let attempts = 0;    
    while (attempts < maxAttempts) {
        attempts++;
        try {
            const result = await apiCall();
            return result;
        } catch (err) {
            if (attempts >= maxAttempts) {
                throw err;
            }
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts - 1) * 1000));
        }
    }
};