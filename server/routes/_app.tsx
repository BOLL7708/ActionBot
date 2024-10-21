import { type PageProps } from '$fresh/server.ts'
export default function App({ Component }: PageProps) {
    return (
        <html lang="en">
            <head>
                <meta charset='utf-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />
                <title>desbot</title>
                <link rel='icon' href='/logo.svg' />
                <link rel='stylesheet' href='/styles.css' />
            </head>
            <body>
                <Component />
            </body>
        </html>
    )
}
