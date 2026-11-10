# Internet Repair Crew

Midnight Relay went dark. Scroll through a short repair story as three mouse pointers trace a broken route, rebuild a rally garage photograph, and recover the log that goes with it.

The sequence runs both ways. Use the chapter buttons to jump to a repair or choose **Skip to repaired page** to see the completed archive. The archive also opens restored when your device requests reduced motion.

## Run locally

From the project folder, run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Run `npm run build` to type-check and generate a production build in `dist/`.

## Project notes

- [Creative brief and storyboard](scrollcraft/builds/midnight-relay/BRIEF.md)
- [Design system](design-system/internet-repair-crew/MASTER.md)

React renders the controls and archive. The vendored ScrollCraft engine drives scroll position, GSAP supplies the timing curves, and Canvas draws the cursor crew over the live page. The original ScrollCraft license is in [src/vendor/LICENSE](src/vendor/LICENSE).
