export function withAuthorization(children: JSX.Element, roles: string[], userRoles: string[]) {
  const authenticated = roles.some((item) => userRoles.includes(item));
  return authenticated ? children : '';
}
