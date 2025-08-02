import TreeNavigate, { TREE_LEAF_FLAG, Leaf } from 'tree-navigate';
import { isJSONTypeData, JSONTypeData } from '@/features/JSONType';

class DefaultValueProvider {
    #navigate: TreeNavigate<JSONTypeData> | null;

    constructor(navigate: TreeNavigate<JSONTypeData> | null = null) {
        this.#navigate = navigate;
    }

    get(key: string): unknown {
        if (this.#navigate == null) {
            return undefined;
        }

        const result = this.#navigate.walk(key, { allowIntermediate: true });

        if (result == null) {
            return undefined;
        }
        else if (isJSONTypeData(result.value)) {
            const defaultValue = result.value.default_value;

            return (
                (defaultValue != null)
                    ? defaultValue
                    : undefined
            );
        }
        else {
            // for (const [key, value] of Object.entries(result.value)) {
            //     console.log(key, value);
            // }

            return this.#getDefaultData(result.value);
        }

        return undefined;
    }

    #getDefaultData(typeData: Leaf<JSONTypeData> | object): unknown {
        if (TREE_LEAF_FLAG in typeData) {
            if (typeData.value.default_value != null) {
                return typeData.value.default_value;
            }

            return undefined;
        }
        else {
            let hasKey = false;
            const result: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(typeData)) {
                const defaultValue = this.#getDefaultData(value as object);
                if (defaultValue !== undefined) {
                    result[key] = defaultValue;
                    hasKey = true;
                }
            }

            return (
                hasKey
                    ? result
                    : undefined
            )
        }
    }
}

export default DefaultValueProvider;
