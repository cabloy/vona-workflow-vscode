export function firstCharToLowerCase(name: string) {
  return name.charAt(0).toLowerCase() + name.substring(1);
}

export function firstCharToUpperCase(name: string) {
  return name.charAt(0).toUpperCase() + name.substring(1);
}
