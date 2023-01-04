require( 'dotenv' ).config()
const axios = require('axios')

const getUserDiscount = async (customerId, email) => {
    try {
        const calculate = await axios.post(`${process.env.ECWID_API_URL}/order/calculate`, {
            email: email,
            customerId: customerId,
            items: [
              {
                "productId": 0,
                "quantity": 1
              }
            ]
        }, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: process.env.IDELIKA_ACCESS_TOKEN
          },
        })

        return { type: calculate.data.discountInfo[0].type, value: calculate.data.discountInfo[0].value }
    } catch(error) {
        //console.log(`Error fetching user's discount.`)
        return { type: "PERCENT", value: 0 }
    }
    
}

module.exports = { getUserDiscount }