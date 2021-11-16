const express = require("express");
const app = express();

app.use(express.urlencoded({extended: false}));
const exampleFragment = `Example of Read and parse 
                         POST/PATCH/PUT request JSON 
                         or form body with Express 
                         and no dependencies`;
const seeCodeFragment = `<strong>Deploying on vercel.com</strong>`
const testText = `<html>
                        <body>
                          ${exampleFragment}
                          <h2>Submit the following form</h2>
                          <div>
                            <form action="/form" method="post">
                              <label for="something">Enter something:</label>
                              <input type="text" id="something" name="something" />
                              <button type="submit" value="">Send it</button>
                            </form>
                          </div>
                          ${seeCodeFragment}
                        </body>
                    </html>
`;

app.get("/", (req, res) => res.send(testText));

app.post("/form", (req, res) => {
    res.send(`<html>
                      <body>
                        ${exampleFragment}
                        <p>
                          Full body is: <pre><code>${JSON.stringify(req.body)}</code></pre>
                        </p>
                        <p><a href="/">Go back</a></p>
                        ${seeCodeFragment}
                      </body>
                    </html>
                `
    );
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});