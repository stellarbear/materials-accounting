class SafeJSON {
    static parse = (input, defaultValue) => {
        if (input == null) {
            return defaultValue;
        }
        
        try {
            return JSON.parse(input)
        } catch {
            return defaultValue;
        }
    }
}

export default SafeJSON