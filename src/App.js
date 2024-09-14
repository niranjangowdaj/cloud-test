import React, { useState, useEffect } from 'react';
import { Stage, Layer, Image, Text, Rect } from 'react-konva';
import useImage from 'use-image';
import './App.css';

const ServerImage = ({ src, ...props }) => {
  const [image] = useImage(src);
  return <Image image={image} {...props} />;
};

function App() {
  const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [servers, setServers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [sliderValue, setSliderValue] = useState(100);

  const serverWidth = 50;
  const serverHeight = 50;
  const allocationAreaSize = 400;
  const allocationArea = {
    x: (stageSize.width - allocationAreaSize) / 2,
    y: (stageSize.height - allocationAreaSize) / 2,
    width: allocationAreaSize,
    height: allocationAreaSize
  };

  useEffect(() => {
    const handleResize = () => {
      setStageSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const addServer = () => {
    const newServer = {
      id: Date.now(),
      x: Math.random() * (stageSize.width - serverWidth),
      y: Math.random() * (stageSize.height - serverHeight - 20),
      name: `Server ${servers.length + 1}`
    };
    setServers([...servers, newServer]);
  };

  const handleDragMove = (e, id) => {
    const newX = Math.max(0, Math.min(e.target.x(), stageSize.width - serverWidth));
    const newY = Math.max(0, Math.min(e.target.y(), stageSize.height - serverHeight - 20));

    setServers(
      servers.map((server) =>
        server.id === id ? { ...server, x: newX, y: newY } : server
      )
    );
  };

  const isInAllocationArea = (server) => {
    return (
      server.x >= allocationArea.x &&
      server.x + serverWidth <= allocationArea.x + allocationArea.width &&
      server.y >= allocationArea.y &&
      server.y + serverHeight <= allocationArea.y + allocationArea.height
    );
  };

  const serversInArea = servers.filter(isInAllocationArea);
  const totalRequests = serversInArea.length * 200 > sliderValue ? sliderValue : serversInArea.length * 200;

  return (
    <div className="App">
      <button 
        onClick={addServer}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          fontSize: '24px',
          zIndex: 1
        }}
      >
        +
      </button>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <label htmlFor="request-slider">Requests({sliderValue})</label>
        <input
          id="request-slider"
          type="range"
          min="1"
          max="1000"
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          style={{ width: '200px' }}
        />
      </div>
      <Stage 
        width={stageSize.width} 
        height={stageSize.height}
        onClick={(e) => {
          if (e.target === e.target.getStage()) {
            setSelectedId(null);
          }
        }}
      >
        <Layer>
          <Rect
            x={allocationArea.x}
            y={allocationArea.y}
            width={allocationArea.width}
            height={allocationArea.height}
            fill="lightgray"
          />
          {servers.map((server) => (
            <React.Fragment key={server.id}>
              <ServerImage
                src="https://pngimg.com/uploads/server/server_PNG33.png"
                x={server.x}
                y={server.y}
                width={serverWidth}
                height={serverHeight}
                draggable
                onClick={() => setSelectedId(server.id)}
                onDragMove={(e) => handleDragMove(e, server.id)}
                stroke={server.id === selectedId ? 'black' : null}
                strokeWidth={server.id === selectedId ? 2 : 0}
              />
              <Text
                x={server.x}
                y={server.y + serverHeight + 5}
                text={server.name}
                fontSize={12}
                fill="black"
                width={serverWidth}
                align="center"
              />
            </React.Fragment>
          ))}
          <Text
            x={allocationArea.x}
            y={allocationArea.y + allocationArea.height + 10}
            text={`Requests that can be handled: ${totalRequests}`}
            fontSize={16}
            fill="black"
            width={allocationArea.width}
            align="center"
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
