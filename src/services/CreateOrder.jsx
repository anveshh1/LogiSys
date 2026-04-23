import { placeOrder, getQueuePosition } from '../services/orderService'
import { useAuth } from '../context/AuthContext'
const { user } = useAuth()

console.log("USER:", user)
async function handleOrder(productId) {
  try {
    const order = await placeOrder(user.id, productId, 1)
    const position = await getQueuePosition(order)

    alert(`Order placed! Queue position: ${position}`)
  } catch (err) {
    console.error(err)
    alert("Order failed")
  }
}