import { useEffect, useRef, VFC } from 'react';
import styled from 'styled-components';

const App: VFC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode>();
  const animeIdRef = useRef<number>();
  const volumeRef = useRef(0.05);

  /**
   * 曲を再生させたとき
   */
  const playHandler = () => {
    if (!analyserRef.current) {
      const audioContext = new AudioContext();
      const src = audioContext.createMediaElementSource(audioRef.current);
      const analyser = audioContext.createAnalyser();
      src.connect(analyser);
      analyser.connect(audioContext.destination);
      analyser.fftSize = 256;
      analyserRef.current = analyser;
    }

    audioRef.current.volume = volumeRef.current;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    canvasRef.current.width = window.innerWidth;
    canvasRef.current.height = window.innerHeight;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvasRef.current.getContext('2d')!;

    renderFrame(ctx, dataArray);
  };

  /**
   * フレーム毎にcanvasに描画する
   * @param ctx
   * @param dataArray
   */
  function renderFrame(ctx: CanvasRenderingContext2D, dataArray: Uint8Array) {
    const WIDTH = ctx.canvas.width;
    const HEIGHT = ctx.canvas.height;
    const dataLength = dataArray.length;
    const barWidth = WIDTH / dataLength;
    let x = 0;

    analyserRef.current.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < dataLength; i++) {
      const barHeight = dataArray[i];

      const r = barHeight + 25 * (i / dataLength);
      const g = 250 * (i / dataLength);
      const b = 50;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, HEIGHT / 2, barWidth, -barHeight);
      ctx.fillRect(x, HEIGHT / 2, barWidth, barHeight);

      x += barWidth + 1;
    }

    animeIdRef.current = requestAnimationFrame(() =>
      renderFrame(ctx, dataArray)
    );
  }

  useEffect(
    () => () => {
      if (animeIdRef.current) {
        cancelAnimationFrame(animeIdRef.current);
      }
    },
    []
  );

  return (
    <Container>
      <Canvas ref={canvasRef} />
      <Audio
        ref={audioRef}
        // className={player}
        controls
        loop
        src="./assets/たぬきちの冒険.mp3"
        onPlay={playHandler}
        // eslint-disable-next-line no-return-assign
        onVolumeChange={() => (volumeRef.current = audioRef.current.volume)}
      >
        <track kind="captions" />
      </Audio>
    </Container>
  );
};

// ==============================================
// styles

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
`;
const Audio = styled.audio`
  position: absolute;
  bottom: 20px;
`;

export default App;
