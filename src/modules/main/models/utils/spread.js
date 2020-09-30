export function spreadNewsExists(values) {
    return values.reduce(
        (filter, value) => {
            if (Number.isInteger(+value)) {
                return { ...filter, existence: [...filter.existence, value] };
            }
            return { ...filter, newest: [...filter.newest, value] };
        },
        {
            existence: [],
            newest: [],
        },
    );
}
