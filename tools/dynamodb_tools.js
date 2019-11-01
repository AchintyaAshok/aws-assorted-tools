/* https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/CapacityUnitCalculations.html */

const calculateStringSize = (value) => {
    return value.length
}

const calculateStringAttributeSize = (attributeKey, attributeValue) => {
    let keySize = calculateStringSize(attributeKey)
    let valSize = calculateStringSize(attributeValue)
    return {
        attributeKey: keySize,
        attributeValue: valSize,
        total: (keySize + valSize)
    }
}

/**
 * Numbers are variable length, with up to 38 significant digits. Leading and trailing zeroes are trimmed. 
 * The size of a number is approximately (length of attribute name) + (1 byte per two significant digits) + (1 byte).
 * @param {*} attributeKey 
 * @param {*} attributeValue 
 */
const calculateNumberAttributeSize = (attributeKey, attributeValue) => {
    let keySize = calculateStringSize(attributeKey)
    let valueSize = calculateStringSize(String(Math.ceil((attributeValue/2))))
    let extraByte = 1
    let totalSize = keySize + valueSize + extraByte

    return {
        attributeKey: keySize,
        attributeValue: valueSize,
        total: totalSize
    }
}

/**
 * This function calculates the the expected item size & other attributes pertinent to DDB development.
 * 
 * @param {Object} item The DynamoDB item that's received from the text view of the dynamodb table.
 */
const getItemStatistics = (item) => {
    if (typeof(item) == String) {
        item = JSON.parse(item)
    }

    let itemStats = []

    /**
     * {
     *      attrA: {
     *          "S": <value>
     *      },
     *      attrB: {
     *          "N": <value>
     *      }
     * }
     */
    for (let [k, v] of Object.entries(item)) {
        let attributeType = Object.keys(v)[0]
        let attributeValue = v[attributeType]
        if (attributeType == 'N') {
            itemStats.push(calculateNumberAttributeSize(k, attributeValue))
        } else if (attributeType == 'S') {
            itemStats.push(calculateStringAttributeSize(k, attributeValue))
        }
    }

    return itemStats
}

let result = getItemStatistics({"vizzini": {"N": 123124}})
console.log(JSON.stringify(result))
