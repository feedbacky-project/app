export const getEnvVar = (envVar, fallback = "") => {
    if(process.env.NODE_ENV === "development") {
        return process.env[envVar] || fallback;
    }
    return window._env_[envVar] || fallback;
};