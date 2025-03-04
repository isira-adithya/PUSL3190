import express from "express";
const router = express.Router();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

router.options('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).send();
}); 

router.post('/', async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const alertData = req.body;

        await prisma.xSSAlert.create({
            data: {
                timestamp: new Date(),
                userAgent: alertData.userAgent,
                cookies: alertData.cookies,
                timezone: alertData.timezone,
                timezoneName: alertData.timezoneName,
                currentTime: alertData.currentTime,
                isInIframe: alertData.isInIframe,

                document: {
                    create: {
                        title: alertData.document.title,
                        URL: alertData.document.URL,
                        domain: alertData.document.domain,
                        referrer: alertData.document.referrer,
                        lastModified: alertData.document.lastModified,
                        readyState: alertData.document.readyState,
                        characterSet: alertData.document.characterSet,
                        contentType: alertData.document.contentType,
                        designMode: alertData.document.designMode,
                        children: alertData.document.children,
                    },
                },

                location: {
                    create: {
                        href: alertData.location.href,
                        protocol: alertData.location.protocol,
                        host: alertData.location.host,
                        hostname: alertData.location.hostname,
                        port: alertData.location.port,
                        pathname: alertData.location.pathname,
                        search: alertData.location.search,
                        hash: alertData.location.hash,
                        origin: alertData.location.origin,
                    },
                },

                permissions: {
                    create: Object.entries(alertData.permissions).map(([name, status]) => ({
                        name: name,
                        status: status,
                    })),
                },

                scripts: {
                    create: alertData.scripts.map(script => ({
                        src: script.src,
                        type: script.type,
                        async: script.async,
                        defer: script.defer,
                    })),
                },

                metaTags: {
                    create: alertData.metaTags.map(meta => ({
                        name: meta.name,
                        content: meta.content,
                        httpEquiv: meta.httpEquiv,
                        property: meta.property,
                    })),
                },
            },
        });

        console.log(`Successfully stored data from ${alertData.document.URL} - ${alertData.userAgent}`)
        res.status(200).send();
    } catch (error) {
        console.error('Error storing data:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;