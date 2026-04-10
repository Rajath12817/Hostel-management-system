const Api = {
    async request(path, options = {}) {
        const response = await fetch(path, {
            headers: {"Content-Type": "application/json", ...(options.headers || {})},
            ...options
        });
        const text = await response.text();
        const body = text ? JSON.parse(text) : null;
        if (!response.ok) {
            throw new Error(body?.message || "Request failed");
        }
        return body;
    },
    get(path) {
        return this.request(path);
    },
    post(path, data = {}) {
        return this.request(path, {method: "POST", body: JSON.stringify(data)});
    },
    put(path, data = {}) {
        return this.request(path, {method: "PUT", body: JSON.stringify(data)});
    },
    delete(path) {
        return this.request(path, {method: "DELETE"});
    }
};
