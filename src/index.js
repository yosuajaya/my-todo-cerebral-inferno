import { render, Component, linkEvent } from 'inferno';
import { Container, connect } from '@cerebral/inferno'
import App, { state, props } from 'cerebral'
import { merge, splice } from 'cerebral/factories'

const addNewTodoItem = ({ store }) => {
  store.push(state`todoItems`, { name: new Date().getTime(), fruidId: null })
}

const app = new App({
  state: {
    todoItems: []
  },
  sequences: {
    newTodoItemAdded: [
      addNewTodoItem
    ],
    onTodoItemChanged: [
      merge(state`todoItems.${props`arrayIndex`}`, props`attributes`)
    ],
    onTodoItemRemoved: [
      // ({ props, get, store }) => {
      //   const { arrayIndex } = props
      //   const tools = [].concat(get(state`todoItems`))

      //   tools.splice(arrayIndex, 1)

      //   store.set(state`todoItems`, tools)
      // }
      splice(state`todoItems`, props`arrayIndex`, 1)
    ]
  }
})

const TodoList = connect(
  {
    items: state`todoItems`
  },
  class TodoList extends Component {
    _onBtnAddNewItemClicked() {
      const handler = app.getSequence('newTodoItemAdded')

      handler()
    }

    render() {
      const { props, _onBtnAddNewItemClicked } = this
      const { items } = props
      console.log('parent component is Rendered!');
      console.log('items:', items);

      return (
        <table>
          <thead>
            <tr><th colSpan="5">TODO LIST</th></tr>
            <tr><th>Fruit</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>
            {
              items.map((_item, _idx) => 
                <TodoItem key={_idx} index={_idx} />
              )
            }
          </tbody>
          <tfoot>
            <tr>
              <td>
                <button type="button" onClick={linkEvent(this, _onBtnAddNewItemClicked)}>
                  Add Item
                </button>
              </td>
            </tr>
          </tfoot>
        </table>
      )
  }
})

const TodoItem = connect(
  {
    item: state`todoItems.${props`index`}`
  },
  class TodoItem extends Component {
    _onClickRemoveItem(context) {
      const handler = app.getSequence('onTodoItemRemoved')

      handler({ arrayIndex: context.props.index })
    }

    _onChangeFruitId(context, event) {
      const hander = app.getSequence('onTodoItemChanged')

      hander({ arrayIndex: context.props.index, attributes: { fruitId: Number(event.target.value) } })
    }

    render() {
      const { props, _onClickRemoveItem, _onChangeFruitId } = this
      const { index, item } = props
      const { fruitId } = item
      console.log('child component is rendered!, which has index:', index);
      console.log('item:', item);

      return (
        <tr>
          <td>
            <select placeholder="Select a fruit..." value={fruitId}
              onChange={linkEvent(this, _onChangeFruitId)}>
              <option value={0}>Select an option</option>
              <option value={1}>Apple</option>
              <option value={2}>Orange</option>
              <option value={3}>Grape</option>
              <option value={4}>Dragon Fruit</option>
              <option value={5}>Watermelon</option>
              <option value={6}>Pineapple</option>
              <option value={7}>Strawberry</option>
            </select>
          </td>
          <td>Item Name: {item.name}</td>
          <td>
            <button type="button" onClick={linkEvent(this, _onClickRemoveItem)}>
              Remove Item
            </button>
          </td>
        </tr>
      )
    }
  }
)

render(
  <Container app={app}>
    <TodoList />
  </Container>,
  document.getElementById('app')
);
