import React from "react";
import { Table } from "./table";
import { getInitialFlightData } from "./data-provider"

const App = (props) => {
  const [data, setData] = React.useState(getInitialFlightData())
  const eventSourceRef = React.useRef(null)
  const columns = React.useMemo(() => [
    {
      Header: "Origin",
      accessor: "origin"
    },
    {
      Header: "Flight",
      accessor: "flight"
    },
    {
      Header: "Arrival",
      accessor: "arrival"
    },
    {
      Header: "State",
      accessor: "state"
    }
  ])

  React.useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/events')
    eventSource.addEventListener('flightStateUpdate', (e) => {
      const flightState = JSON.parse(e.data)
      setData(data => {
        const newData = data.map(item => {
          if (item.flight === flightState.flight) {
            item.state = flightState.state;
          }
          return item;
        })
        return newData
      })
    })
    eventSource.addEventListener('flightRemoval', (e) => {
      const flightInfo = JSON.parse(e.data)
      setData(data => {
        const newData = data.filter((item) => item.flight !== flightInfo?.flight);
        return newData
      })
    })
    eventSource.addEventListener('closedConnection', () => eventSource.close())
    eventSourceRef.current = eventSource
  }, [])

  const stopUpdates = () => {
    eventSourceRef.current?.close()
  }

  return (
    <div className="App">
      <button onClick={() => stopUpdates()}>Stop updates</button>
      <Table columns={columns} data={data} />
    </div>
  )
}

export default App