import { render, Component, linkEvent } from 'inferno';
import App, { state, props } from 'cerebral'
import { Container, connect } from '@cerebral/inferno'

const addNewTodoItem = ({ store }) => {
  store.push(state`todoItems`, { name: new Date().getTime() })
}

const app = new App({
  state: {
    todoItems: []
  },
  sequences: {
    newTodoItemAdded: [
      addNewTodoItem
    ],
    onTodoItemRemoved: [
      ({ props, get, store }) => {
        const { arrayIndex } = props
        const tools = [].concat(get(state`todoItems`))

        tools.splice(arrayIndex, 1)

        store.set(state`todoItems`, tools)
      }
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
            <tr><th>Date</th><th>Action</th></tr>
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

    render() {
      const { props, _onClickRemoveItem } = this
      const { index, item } = props
      console.log('child component is rendered!, which has index:', index);
      console.log('item:', item);

      return (
        <tr>
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
