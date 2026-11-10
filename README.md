# Internet Repair Crew

A 60–90 second interactive short about three mouse pointers restoring a forgotten personal homepage. The visitor scrolls to move the repair forward, and the same crew travels from one component to the next.

## Phase 1 · Creative brief

The page belongs to Mira, who used it to post little things from her neighborhood. One photograph survived in fragments: the corner shop on the first evening its lights came back on after a blackout. The broken homepage opens in cool gray. Warm color returns with the photo, and the last repair reveals why Mira saved it.

| Cursor | Job | How it moves |
| --- | --- | --- |
| **Patch** · cyan | Reconnects links and traces missing outlines | Follows edges and turns sharply at corners |
| **Fetch** · amber | Finds and carries missing pieces | Takes wide arcs and slows with a piece in tow |
| **Set** · mint | Aligns components and puts the finishing touches in place | Makes small nudges before snapping into position |

| Scene | What the visitor sees and does | On-screen copy |
| --- | --- | --- |
| **01 · Boot** | A damaged homepage shows an empty photo frame and the beginning of a note. The crew arrives. A loose connector twitches as the visitor starts scrolling. | “Mira’s corner of the web” · “Scroll to help restore this page.” |
| **02 · Reconnect** | Patch traces a broken wire while Fetch carries the loose connector and Set holds the socket in place. The header lights up. **Photo** and **Note** become working links. | “Navigation restored.” |
| **03 · Recover** | Patch draws the photo frame. Fetch pulls in three fragments and Set nudges their edges together. The last piece brings back the photo’s warm shop lights. The visitor can open the full photo. | “The first night the lights came back.” · “Open photo” |
| **04 · Restore** | Fetch brings back a strip of missing text. Patch draws its underline and Set fits it into the note. The crew parks at the edge of the page while the visitor reads. | “I took this from across the street. Everyone came out when the lights came back. If you found this, I’m glad the page is still here.” |

The first release is one page with four scenes, one photo, and one note. Scrolling backward rewinds the repair. The finished page is available through **Skip to repaired page** and opens directly for visitors who prefer reduced motion.

## Next milestone

Storyboard the broken, mid-repair, and finished states for each scene at desktop and phone sizes. Then prototype **Recover** with Vite, React, TypeScript, CSS, GSAP ScrollTrigger, and a Canvas 2D overlay for the cursors. The prototype is ready when the same three cursors visibly draw, carry, and assemble the photo, and the finished photo opens on both desktop and touch.
