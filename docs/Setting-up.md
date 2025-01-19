# Injecting code to the webpage

1. In order to setup tailwind css with plasmo use the template `pnpm create plasmo --with-tailwindcss`, the regular route is hassle-ful
2. For some reason, code injection does not work if you use "https://www.xyz.com" instead use "https://xyz.com"
3. To add blur to the background use `plasmo-backdrop-blur-sm`
4. Overlay, console, and dialogbox are sister components and are inter-dependent, so rather than using prop-drilling or having a complex state management. I'have simply used the content.tsx as the center that handles all the interdependebality.
5. Passing on isTimerRunning dependency is necessary in **Console.tsx** as it in necessary for updating the state of isTimerRunning within the useEffect block. React closure gives the useEffect the initial value of iSTimerRunning when useEffect was initially called. Therefore, needs to be updated as isTimerRunning is flipped on/off.
6. `import { Storage } from "@plasmohq/storage"` is required to store the position of the console in persistence. It stores the data into the local storage of the extension.
