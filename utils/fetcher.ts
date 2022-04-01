const fetcher = async (
    input: RequestInfo,
    init?: RequestInit
) => await fetch(input, init).then(res => res.json())

export default fetcher