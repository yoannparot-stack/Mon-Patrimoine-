"""Keep packaged app documents separate from external browser content."""
from pathlib import Path
import sys
import re

p = Path(sys.argv[1]) / 'app/src/main/java/com/monpatrimoine/app/MainActivity.java'
s = p.read_text()
if 'immoptimaTrustedDocument(' in s:
    sys.exit(0)
anchor = '        webView.setWebViewClient(new WebViewClient() {'
assert s.count(anchor) == 1
s = s.replace(anchor, anchor + '''
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return true;
                return immoptimaHandleNavigation(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return immoptimaHandleNavigation(android.net.Uri.parse(url));
            }
''', 1)
anchor = 'return assetLoader.shouldInterceptRequest(request.getUrl());'
assert s.count(anchor) == 1
s = s.replace(anchor, '''if (request.isForMainFrame() && !immoptimaTrustedDocument(request.getUrl())) {
                    return new android.webkit.WebResourceResponse("text/plain", "UTF-8", 403, "Forbidden",
                        java.util.Collections.singletonMap("Content-Security-Policy", "default-src 'none'"),
                        new java.io.ByteArrayInputStream(new byte[0]));
                }
                return immoptimaProtectDocument(request.getUrl(), assetLoader.shouldInterceptRequest(request.getUrl()));''', 1)
anchor = r'return assetLoader\.shouldInterceptRequest\((?:android\.net\.)?Uri\.parse\(url\)\);'
assert len(re.findall(anchor, s)) == 1
s = re.sub(anchor, 'return immoptimaProtectDocument(android.net.Uri.parse(url), assetLoader.shouldInterceptRequest(android.net.Uri.parse(url)));', s, count=1)
anchor = '    @Override public void onBackPressed() {'
assert anchor in s
s = s.replace(anchor, '''    private boolean immoptimaTrustedDocument(android.net.Uri uri) {
        return uri != null && "https".equals(uri.getScheme())
            && "appassets.androidplatform.net".equals(uri.getHost())
            && uri.getPort() == -1 && uri.getUserInfo() == null
            && "/assets/index.html".equals(uri.getPath()) && uri.getQuery() == null;
    }

    private boolean immoptimaHandleNavigation(android.net.Uri uri) {
        if (immoptimaTrustedDocument(uri)) return false;
        // Only HTTPS references leave the app, without its JavaScript interfaces.
        if (uri != null && "https".equals(uri.getScheme()) && uri.getHost() != null
                && uri.getUserInfo() == null && !"appassets.androidplatform.net".equals(uri.getHost())) {
            try {
                Intent browser = new Intent(Intent.ACTION_VIEW, uri);
                browser.addCategory(Intent.CATEGORY_BROWSABLE);
                startActivity(browser);
            } catch (android.content.ActivityNotFoundException error) {
                Toast.makeText(this, "Aucun navigateur disponible pour ouvrir ce lien.", Toast.LENGTH_LONG).show();
            }
        }
        return true;
    }

    private android.webkit.WebResourceResponse immoptimaProtectDocument(android.net.Uri uri, android.webkit.WebResourceResponse response) {
        if (response != null && immoptimaTrustedDocument(uri)) {
            java.util.Map<String,String> headers = new java.util.HashMap<>();
            if (response.getResponseHeaders() != null) headers.putAll(response.getResponseHeaders());
            // The native bridge is visible to every frame. No embedded document is needed.
            headers.put("Content-Security-Policy", "frame-src 'none'; object-src 'none'; base-uri 'none'");
            response.setResponseHeaders(headers);
        }
        return response;
    }

'''+anchor, 1)
p.write_text(s)
print('Navigation isolated: packaged document only, external HTTPS in browser, embedded documents blocked.')
