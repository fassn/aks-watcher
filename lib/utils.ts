export const fetcher = async (
    input: RequestInfo,
    init?: RequestInit
): Promise<any> => await fetch(input, init).then(res => res.json())