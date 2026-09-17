// Memory-only JWT storage (NEVER localStorage per strict security requirement)
let inMemoryAccessToken = null;

export const tokenHelper = {
  getAccessToken: () => inMemoryAccessToken,
  setAccessToken: (token) => {
    inMemoryAccessToken = token;
  },
  clearAccessToken: () => {
    inMemoryAccessToken = null;
  },
  hasAccessToken: () => Boolean(inMemoryAccessToken),
};
