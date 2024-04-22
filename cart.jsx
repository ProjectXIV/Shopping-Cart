// simulate getting products from DataBase
const products = [
    { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
  ];
  
  //=========Cart=============
  const Cart = (props) => {
    const { Card, Accordion, Button } = ReactBootstrap;
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
    
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
  };
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
      console.log("useEffect Called");
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };

  const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [restockInputs, setRestockInputs] = React.useState(
      products.map(product => ({ name: product.name, quantity: 0, isChecked: false }))
    );
    const { Container, Row, Col, Button, ListGroup, ListGroupItem, Image, Form, InputGroup, FormControl } = ReactBootstrap;
  
    React.useEffect(() => {
      const newTotal = cart.reduce((acc, item) => acc + item.cost, 0);
      setTotal(newTotal);
    }, [cart]);
  
    const addToCart = (item) => {
      if (item.instock > 0) {
        const newCart = [...cart, item];
        setCart(newCart);
        const newItems = items.map(prod => {
          if (prod.name === item.name) {
            return { ...prod, instock: prod.instock - 1 };
          }
          return prod;
        });
        setItems(newItems);
      }
    };
  
    const checkOut = () => {
      setCart([]);
      setTotal(0);
    };
  
    const updateRestockInput = (index, value, field) => {
      const newRestockInputs = [...restockInputs];
      newRestockInputs[index][field] = value;
      setRestockInputs(newRestockInputs);
    };
  
    const restockProducts = () => {
      const newItems = items.map(item => {
        const restockInput = restockInputs.find(ri => ri.name === item.name && ri.isChecked);
        return restockInput ? {
          ...item,
          instock: item.instock + parseInt(restockInput.quantity || 0, 10)
        } : item;
      });
      setItems(newItems);
    };
  
    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

    let list = items.map((item, index) => (
      <ListGroupItem key={index} className="d-flex justify-content-between align-items-center">
        <Image src={photos[index % photos.length]} width={50} height={50} roundedCircle />
        {item.name}: ${item.cost} - In stock: {item.instock}
        <Button variant="primary" size="sm" onClick={() => addToCart(item)}>
          Add to Cart
        </Button>
      </ListGroupItem>
    ));
  
    let cartList = cart.map((item, index) => (
      <ListGroupItem key={index}>
        {item.name}: ${item.cost}
      </ListGroupItem>
    ));
  
    let restockList = restockInputs.map((input, index) => (
      <Form.Group key={index} controlId={`restock-${input.name}`}>
        <Form.Check
          type="checkbox"
          label={input.name}
          checked={input.isChecked}
          onChange={(e) => updateRestockInput(index, e.target.checked, 'isChecked')}
        />
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Quantity"
            type="number"
            value={input.quantity}
            onChange={(e) => updateRestockInput(index, e.target.value, 'quantity')}
            disabled={!input.isChecked}
          />
        </InputGroup>
      </Form.Group>
    ));
  
    return (
      <Container>
        <Row>
          <Col md={6}>
            <h1>Product List</h1>
            <ListGroup>{list}</ListGroup>
          </Col>
          <Col md={6}>
            <h1>Cart Contents</h1>
            <ListGroup>{cartList}</ListGroup>
            <Button variant="warning" onClick={checkOut}>CheckOut $ {total}</Button>
          </Col>
          <Col xs={12}>
            <h1>Restock List</h1>
            {restockList}
            <Button variant="primary" onClick={restockProducts}>ReStock Products</Button>
          </Col>
        </Row>
      </Container>
    );
  };
  
  // ========================================
  ReactDOM.render(<Products />, document.getElementById("root"));
  
