import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const rowStyle = {
  width: 600,
  height: 60
};

const pointStyle = {
  width: 60,
  height: 60,
  border: "solid 1px gray",
  display: "inline-block",
  boxSizing: "border-box",
  lineHeight: "30px"
};

const directionDeltas = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1]
];

class App extends React.Component{
  constructor(){
    super();
    this.state = {
      data: [...Array(8)].map(arr=> {
        return [...Array(8)].map(point=>0);
        })
    };
    this.state.data[4][3] = -1; //左上（0，0）
    this.state.data[3][4] = -1;
    this.state.data[4][4] = 1;
    this.state.data[3][3] = 1;
    this.state.turn = 1;
  }

  handlePointClick = (rowIndex,colIndex) => {
    return () => {
      this.setState(prevState => {
        const prevData = prevState.data;
        const newTurn = -prevState.turn;
        const newData = [...prevData];
        newData[rowIndex] = [...prevData[rowIndex]];
        newData[rowIndex][colIndex] = prevState.turn;

        directionDeltas.forEach(delta =>{
          const pointsToInverse = [];
          let ready = false;
          let done = false;
          for(let step=1;step<9;step++){
            const [xDelta,yDelta] = delta;
            const targetRowIndex = rowIndex + xDelta*step;
            const targetColIndex = colIndex + yDelta*step;
            if(
              targetRowIndex<0 ||
              targetRowIndex>7 ||
              targetColIndex<0 ||
              targetColIndex>7 
            ) {
              return;
            }
            const targetPoint = prevData[targetRowIndex][targetColIndex];

            if(targetPoint === -this.state.turn){
              ready = true;
              pointsToInverse.push([targetRowIndex,targetColIndex])
            }
            if(targetPoint === 0){
              return;
            }
            if(targetPoint===this.state.turn){
              if(ready){
                done = true;
                break;
              } else{
                break;
              }
            }
          }
          if(done){
            pointsToInverse.forEach(([rowIndex,colIndex])=>{
              newData[rowIndex] = [...newData[rowIndex]];
              newData[rowIndex][colIndex] = prevState.turn;
            });
          }
        });

        return {
          data: newData,
          turn: newTurn
        };
      });
    };
  };

  render(){
    const {data,turn}=this.state;

    const blackPoints = new Set();
    const whitePoints = new Set();
    data.forEach((row,rowIndex)=>
      row.forEach((point,colIndex)=>{
        switch(point){
          case 1:
            blackPoints.add(`${rowIndex}:${colIndex}`);
            break;
          case -1:
            whitePoints.add(`${rowIndex}:${colIndex}`);
            break;
          default:
        }
      })
    );

    const currentPlayPoints = turn === 1 ? blackPoints:whitePoints;

    const clickableSet = [...currentPlayPoints].reduce(
      (clickableSet,pointCoord)=>{
        const [rowIndexStr,colIndexStr] = pointCoord.split(":");
        const rowIndex = parseInt(rowIndexStr,10);
        const colIndex = parseInt(colIndexStr,10);

        directionDeltas.forEach(delta => {
          let ready = false;
          for (let step = 1; step < 9; step++) {
            const [xDelta, yDelta] = delta;
            const targetRowIndex = rowIndex + xDelta * step;
            const targetColIndex = colIndex + yDelta * step;
            if (
              targetRowIndex < 0 ||
              targetRowIndex > 7 ||
              targetColIndex < 0 ||
              targetColIndex > 7
            ) {
              break;
            }
            const targetPoint = data[targetRowIndex][targetColIndex];

            if(targetPoint===-this.state.turn){
              ready = true;
            }

            if(targetPoint===0){
              if(ready){
                clickableSet.add(`${targetRowIndex}:${targetColIndex}`);
                break;
              }else{
                break;
              }
            }
            if(targetPoint===this.state.turn){
              break;
            }

          }
        });

        return clickableSet;
      },
      new Set()
    );

    return (
      <div className="App">
        <div>
          {data.map((row, rowIndex) => {
            return (
              <div style={rowStyle} key={`row:${rowIndex}`}>
                {row.map((point, colIndex) => {
                  const clickable = clickableSet.has(`${rowIndex}:${colIndex}`);
                  return (
                    <button
                      key={`row:${rowIndex},col:${colIndex}`}
                      style={{
                        ...pointStyle,
                        backgroundColor: clickable ? "yellow" : "green",
                        pointerEvents: clickable ? "inherit" : "none"
                      }}
                      onClick={this.handlePointClick(rowIndex, colIndex)}
                    >
                      {point === 1 ? "●" : point === -1 ? "○" : "-"}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
        <div>Turn : {turn === 1 ? "black" : "white"}</div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
