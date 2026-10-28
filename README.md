# Diwali Surprise Website 🪔✨

A responsive four-scene Diwali greeting made with HTML, CSS, and vanilla JavaScript. It includes canvas fireworks, an optional local looping MP3, a family-photo reveal, replay, and sharing/copy-link fallback. It works as a static site and can be hosted for free with GitHub Pages.

## Project structure

```text
diwali-surprise/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── family-photo.jpg       # Add your own photo
│   ├── diwali-music.mp3       # Add your own audio
│   └── README.txt
└── README.md
```

## Customize the family name and message

Open `script.js` and edit the clearly marked section at the top:

```js
const FAMILY_NAME = "Your Family";
const GREETING_TEXT = "May this Diwali fill your home with happiness...";
```

For example, change `FAMILY_NAME` to your surname. The page adds the word “Family” after the name, so use a name such as `Jadhav` rather than `Jadhav Family` to avoid repeating it.

## Add your family photo

1. Choose a photo you have permission to publish.
2. Copy it into the `assets` folder.
3. Rename it exactly `family-photo.jpg`.
4. Keep the extension in the filename consistent. If your photo is PNG or WebP instead, either convert it to JPG or update both image `src` values in `index.html`.
5. The photo will keep its aspect ratio. If it cannot load, a helpful placeholder appears.

## Add your Diwali music

1. Choose an MP3 file you own or are legally allowed to share.
2. Copy it into `assets`.
3. Rename it exactly `diwali-music.mp3`.
4. The supplied `<audio>` element uses `loop`, so playback repeats automatically. Music begins only after the visitor clicks **Open Your Diwali Surprise**, because browsers commonly block autoplay before a user gesture.
5. The same audio element remains in place as scenes change, so the music does not restart during the reveal or replay.
6. The speaker button mutes/unmutes music for the current visit.

MP3 is the recommended format. Modern browsers can support other formats, but if you use one, update the `<source>` type and file path in `index.html`. Do not use a paid music API or an externally hosted track for this version.

### Audio troubleshooting

- Confirm the path is `assets/diwali-music.mp3` and spelling/capitalization match exactly.
- Check that the file is really an MP3, not an M4A renamed to `.mp3`.
- Try a smaller, standard MP3 export if the file is unusually large or encoded with an unsupported codec.
- Click the welcome button or speaker control; audio will not autoplay before interaction.
- Check the browser console and Network tab for a `404` or decoding error.
- Test on the deployed HTTPS URL and make sure the device is not muted.
- If no file is present, the rest of the website still works and the music status will show a helpful message.

## Run locally in VS Code

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Create a folder named `diwali-surprise`.
3. Create `index.html`, `style.css`, and `script.js` in the root. Create an `assets` subfolder and its `README.txt`.
4. Paste the code into the matching files and save them.
5. Add your photo and audio as described above.
6. Install the **Live Server** extension by Ritwick Dey in VS Code.
7. Right-click `index.html` and choose **Open with Live Server**.
8. A browser tab should open at a local address similar to `http://127.0.0.1:5500`.

You can also open `index.html` directly for basic checks, but Live Server is recommended for realistic testing and clipboard behavior.

## Testing checklist

- Click **Open Your Diwali Surprise**. The fireworks scene should appear, and audio should attempt to start.
- Confirm fireworks transition to the family photo scene after several seconds. Use **Skip Animation** to move straight to the reveal.
- Confirm **One More Wish** opens the final greeting.
- Confirm **Watch Surprise Again** returns to the welcome scene without restarting the audio.
- Test the mute/unmute control.
- Test **Share This Greeting** on a supported mobile browser. On browsers without native sharing, the page tries to copy the URL and displays a confirmation.
- Temporarily remove/rename the photo to verify the photo fallback; restore it afterward.
- Temporarily remove/rename the MP3 to verify the audio error is handled gracefully; restore it afterward.
- Open Developer Tools (`F12`) and inspect the **Console** and **Network** tabs for errors or missing files.
- In Chrome/Edge DevTools, toggle device emulation and check widths **200, 250, 300, 320, 360, 375, 390, 400, 768, 1024, and 1440 px**. Also test a short viewport height.
- Confirm no horizontal scrollbar appears. This project has responsive CSS but those widths should be manually checked in your target browser/device; they are not claimed as automated test results.
- Confirm the music continues between scenes and does not restart on replay.

## Publish with GitHub Pages (free)

1. Sign in or create an account at [GitHub](https://github.com/).
2. Create a **public** repository named `diwali-surprise`.
3. Upload the contents of this project folder, not the outer folder itself. The repository root must contain `index.html`, `style.css`, `script.js`, `README.md`, and the `assets` folder.
4. In the repository, choose **Settings**.
5. In the left sidebar, open **Pages** (usually under **Code and automation**).
6. Under **Build and deployment**, select **Deploy from a branch**.
7. Choose branch **main** and folder **/(root)**, then click **Save**.
8. Wait for GitHub Pages to finish deploying. Refresh the Pages settings screen if needed.
9. Open the published URL shown on the Pages settings screen. It will usually look like `https://YOUR-USERNAME.github.io/diwali-surprise/`.
10. Test the live HTTPS link on desktop and on a real phone. Check the photo, music, scene transitions, mute control, and share button.

### Upload from the GitHub website

- In your repository, click **Add file → Upload files**.
- Drag the project files and the `assets` folder contents into the upload area, preserving the folder structure.
- Add a commit message such as `Add Diwali surprise website`, then click **Commit changes**.

### Updating the site

Edit the files locally, then upload the changed files to the same paths and commit the changes. GitHub Pages will rebuild the site automatically. Allow a little time, then refresh the live site; a hard refresh (`Ctrl+Shift+R`) can help clear cached files.

## Troubleshooting GitHub Pages

- **404 / site not found:** Check Settings → Pages for the published URL and deployment status. Ensure `index.html` is at the repository root and the branch is `main` with `/(root)` selected.
- **CSS or JS missing:** Confirm `style.css` and `script.js` are at the root and their names match the HTML exactly.
- **Photo/audio missing:** Confirm the files are inside `assets/` and named with matching capitalization. Paths are relative (`assets/...`) for project-site compatibility.
- **Changes do not appear:** Wait for deployment, then hard-refresh or try a private browser window.
- **Audio not starting:** Browsers require user interaction; click the welcome button. Check device volume, file format, and Network/Console errors.
- **Sharing not available:** Native sharing is not supported in every browser. The code falls back to copying the URL; clipboard access is most reliable on HTTPS or localhost.
- **Privacy:** Files committed to a public repository can be viewed and copied by anyone. Do not commit private data, personal documents, or photos/audio you do not have permission to publish. Consider using a private sharing method if you do not want your family photograph public.

## Optional future MERN upgrade

The static version does not need MERN. Later, you could:
1. Build a React interface with reusable scene and greeting components.
2. Add a Node.js + Express API to create and retrieve personalized greeting pages.
3. Store greeting text, sender name, theme, and generated share IDs in MongoDB.
4. Add a dashboard with authentication, validation, and access controls.
5. Deploy the frontend and API separately and configure environment variables securely.

Do not place API secrets in frontend JavaScript. A backend is only necessary when you want persistent user accounts, stored personalized greetings, or a generation dashboard.
