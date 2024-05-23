export function getItemsIn1NotIn2<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(x => !arr2.includes(x))
}