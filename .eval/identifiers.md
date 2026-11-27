# Identifiers in this code

Every row is a `@uxid` comment in this repository: above a declaration (`// @uxid <id>`, `# @uxid <id>` in
Python), or for an element inside its opening tag (`<button /* @uxid <id> */ ...>`). Search the code for an
id to find its place, wherever the file has moved. Ids are permanent: never edit or remove one, and copy
none: a new component gets its own on Eva's next scan.

## Components (17)

| identifier | file | description |
| --- | --- | --- |
| `apps/web/app/account/page::AccountContent` | apps/web/app/account/page.tsx | Function component. Hooks: useAuth. Renders: p, Profile, AuthForms. |
| `apps/web/app/account/page::AccountPage` | apps/web/app/account/page.tsx | Function component. Renders: p, Suspense, AccountContent. |
| `apps/web/app/account/page::AuthForms` | apps/web/app/account/page.tsx | Function component. Hooks: useAuth, useRouter, useSearchParams, useState. Renders: div, button, form, h1, label, input. |
| `apps/web/app/account/page::Profile` | apps/web/app/account/page.tsx | Function component. Hooks: useAuth, useState, useCallback, useEffect. Renders: div, section, h1, p, button, h2, Link. |
| `apps/web/app/cart/page::CartPage` | apps/web/app/cart/page.tsx | Function component. Hooks: useAuth, useCart, useState. Renders: div, h1, p, strong, span, section, Link. |
| `apps/web/app/layout::RootLayout` | apps/web/app/layout.tsx | Function component. Props: children. Renders: html, body, main, footer, div, p, AuthProvider, CartProvider, +3 more. |
| `apps/web/app/page::HomePage` | apps/web/app/page.tsx | Function component. Renders: div, section, p, h1, h2, Link, ProductCard. |
| `apps/web/app/products/[slug]/not-found::ProductNotFound` | apps/web/app/products/[slug]/not-found.tsx | Function component. Renders: div, h1, p, Link. |
| `apps/web/app/products/[slug]/page::ProductPage` | apps/web/app/products/[slug]/page.tsx | Function component. Props: params. Renders: div, nav, img, p, h1, ul, Link, AddToCart. |
| `apps/web/app/products/page::ProductsPage` | apps/web/app/products/page.tsx | Function component. Props: searchParams. Renders: div, aside, form, label, input, select, Link, ProductCard. |
| `apps/web/components/add-to-cart::AddToCart` | apps/web/components/add-to-cart.tsx | Function component. Props: product. Hooks: useCart, useMemo, useState. Renders: p, div, fieldset, legend, button, label, Link. |
| `apps/web/components/auth-provider::AuthProvider` | apps/web/components/auth-provider.tsx | Function component. Props: children. Hooks: useState, useEffect, useCallback, useMemo. Renders: Ctx.Provider. |
| `apps/web/components/cart-provider::CartProvider` | apps/web/components/cart-provider.tsx | Function component. Props: children. Hooks: useAuth, useState, useCallback, useEffect, useMemo. Renders: Ctx.Provider. |
| `apps/web/components/chat-widget::ChatPanel` | apps/web/components/chat-widget.tsx | Function component. Props: open, setOpen. Hooks: useState, useRef, useEffect. Renders: button, span, section, header, div, p. |
| `apps/web/components/chat-widget::ChatWidget` | apps/web/components/chat-widget.tsx | Function component. Hooks: useAuth, useState. Renders: ChatPanel. |
| `apps/web/components/product-card::ProductCard` | apps/web/components/product-card.tsx | Function component. Props: product. Renders: div, img, span, p, h3, Link. |
| `apps/web/components/site-header::SiteHeader` | apps/web/components/site-header.tsx | Function component. Hooks: useAuth, useCart. Renders: header, div, span, nav, Link. |

## Interactive elements (buttons, inputs, links), each inside a component (82)

| identifier | file | in | description |
| --- | --- | --- | --- |
| `apps/web/app/account/page::AuthForms.button` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Button. labelled "Log in / Create account". Handlers: onClick. |
| `apps/web/app/account/page::AuthForms.button-2` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Button. type=submit, can be disabled. |
| `apps/web/app/account/page::AuthForms.div` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | <div> element. |
| `apps/web/app/account/page::AuthForms.email` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Email input. Handlers: onChange. |
| `apps/web/app/account/page::AuthForms.form` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Form. Handlers: onSubmit. |
| `apps/web/app/account/page::AuthForms.input` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Text input field. Handlers: onChange. |
| `apps/web/app/account/page::AuthForms.label` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Field label. labelled "Full name". |
| `apps/web/app/account/page::AuthForms.label-2` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Field label. labelled "Email". |
| `apps/web/app/account/page::AuthForms.label-3` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Field label. labelled "Password". |
| `apps/web/app/account/page::AuthForms.p` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | <p> element. |
| `apps/web/app/account/page::AuthForms.password` | apps/web/app/account/page.tsx | `apps/web/app/account/page::AuthForms` | Password input. Handlers: onChange. |
| `apps/web/app/account/page::Profile.button` | apps/web/app/account/page.tsx | `apps/web/app/account/page::Profile` | Button. labelled "Log out". Handlers: onClick. |
| `apps/web/app/account/page::Profile.button-2` | apps/web/app/account/page.tsx | `apps/web/app/account/page::Profile` | Button. labelled "Cancel order". Handlers: onClick. |
| `apps/web/app/account/page::Profile.link` | apps/web/app/account/page.tsx | `apps/web/app/account/page::Profile` | <Link> component. href "/products", labelled "Start shopping". |
| `apps/web/app/account/page::Profile.p` | apps/web/app/account/page.tsx | `apps/web/app/account/page::Profile` | <p> element. |
| `apps/web/app/cart/page::CartPage.button` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Button. Handlers: onClick. |
| `apps/web/app/cart/page::CartPage.button-2` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Button. Handlers: onClick. |
| `apps/web/app/cart/page::CartPage.button-3` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Button. labelled "Remove". Handlers: onClick. |
| `apps/web/app/cart/page::CartPage.button-4` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Button. type=submit, can be disabled. |
| `apps/web/app/cart/page::CartPage.form` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Form. Handlers: onSubmit. |
| `apps/web/app/cart/page::CartPage.input` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Text input field. Handlers: onChange. |
| `apps/web/app/cart/page::CartPage.label` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | Field label. |
| `apps/web/app/cart/page::CartPage.link` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | <Link> component. href "/account", labelled "View my orders". |
| `apps/web/app/cart/page::CartPage.link-2` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | <Link> component. href "/products", labelled "Keep shopping". |
| `apps/web/app/cart/page::CartPage.link-3` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | <Link> component. href "/products", labelled "Browse products". |
| `apps/web/app/cart/page::CartPage.link-4` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | <Link> component. |
| `apps/web/app/cart/page::CartPage.link-5` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | <Link> component. href "/account?next=/cart", labelled "Log in to check out". |
| `apps/web/app/cart/page::CartPage.p` | apps/web/app/cart/page.tsx | `apps/web/app/cart/page::CartPage` | <p> element. |
| `apps/web/app/layout::RootLayout.link` | apps/web/app/layout.tsx | `apps/web/app/layout::RootLayout` | <Link> component. href "/products", labelled "Shop". |
| `apps/web/app/page::HomePage.link` | apps/web/app/page.tsx | `apps/web/app/page::HomePage` | <Link> component. href "/products", labelled "Shop all". |
| `apps/web/app/page::HomePage.link-2` | apps/web/app/page.tsx | `apps/web/app/page::HomePage` | <Link> component. href "/products?category=shoes", labelled "Shop shoes". |
| `apps/web/app/page::HomePage.link-3` | apps/web/app/page.tsx | `apps/web/app/page::HomePage` | <Link> component. |
| `apps/web/app/products/[slug]/not-found::ProductNotFound.link` | apps/web/app/products/[slug]/not-found.tsx | `apps/web/app/products/[slug]/not-found::ProductNotFound` | <Link> component. href "/products", labelled "Back to shop". |
| `apps/web/app/products/[slug]/page::ProductPage.link` | apps/web/app/products/[slug]/page.tsx | `apps/web/app/products/[slug]/page::ProductPage` | <Link> component. href "/products", labelled "Shop". |
| `apps/web/app/products/[slug]/page::ProductPage.link-2` | apps/web/app/products/[slug]/page.tsx | `apps/web/app/products/[slug]/page::ProductPage` | <Link> component. |
| `apps/web/app/products/page::ProductsPage.button` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Button. type=submit, labelled "Apply". |
| `apps/web/app/products/page::ProductsPage.form` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Form. |
| `apps/web/app/products/page::ProductsPage.label` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Field label. labelled "Search". |
| `apps/web/app/products/page::ProductsPage.label-2` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Field label. labelled "Category". |
| `apps/web/app/products/page::ProductsPage.label-3` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Field label. labelled "Size". |
| `apps/web/app/products/page::ProductsPage.label-4` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Field label. labelled "Min €". |
| `apps/web/app/products/page::ProductsPage.label-5` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Field label. labelled "Max €". |
| `apps/web/app/products/page::ProductsPage.label-6` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Field label. labelled "Sort by". |
| `apps/web/app/products/page::ProductsPage.link` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | <Link> component. href "/products", labelled "Clear". |
| `apps/web/app/products/page::ProductsPage.link-2` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | <Link> component. labelled "Previous". |
| `apps/web/app/products/page::ProductsPage.link-3` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | <Link> component. labelled "Next". |
| `apps/web/app/products/page::ProductsPage.number` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Number input. name "minPrice". |
| `apps/web/app/products/page::ProductsPage.number-2` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Number input. name "maxPrice". |
| `apps/web/app/products/page::ProductsPage.option` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. labelled "All". |
| `apps/web/app/products/page::ProductsPage.option-2` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. |
| `apps/web/app/products/page::ProductsPage.option-3` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. labelled "Any". |
| `apps/web/app/products/page::ProductsPage.option-4` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. |
| `apps/web/app/products/page::ProductsPage.option-5` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. labelled "Name". |
| `apps/web/app/products/page::ProductsPage.option-6` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. labelled "Price: low to high". |
| `apps/web/app/products/page::ProductsPage.option-7` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Select option. labelled "Price: high to low". |
| `apps/web/app/products/page::ProductsPage.q` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Text input field. placeholder "e.g. leggings", name "q". |
| `apps/web/app/products/page::ProductsPage.select` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Dropdown select. name "category". |
| `apps/web/app/products/page::ProductsPage.select-2` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Dropdown select. name "size". |
| `apps/web/app/products/page::ProductsPage.select-3` | apps/web/app/products/page.tsx | `apps/web/app/products/page::ProductsPage` | Dropdown select. name "sort". |
| `apps/web/components/add-to-cart::AddToCart.button` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Button. type=button. Handlers: onClick. |
| `apps/web/components/add-to-cart::AddToCart.button-2` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Button. type=button, can be disabled. Handlers: onClick. |
| `apps/web/components/add-to-cart::AddToCart.button-3` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Button. type=button, can be disabled, labelled "Adding… / Add to cart". Handlers: onClick. |
| `apps/web/components/add-to-cart::AddToCart.fieldset` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Field group. |
| `apps/web/components/add-to-cart::AddToCart.fieldset-2` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Field group. |
| `apps/web/components/add-to-cart::AddToCart.label` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Field label. labelled "Quantity". |
| `apps/web/components/add-to-cart::AddToCart.link` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | <Link> component. href "/cart", labelled "View cart". |
| `apps/web/components/add-to-cart::AddToCart.option` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Select option. |
| `apps/web/components/add-to-cart::AddToCart.p` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | <p> element. |
| `apps/web/components/add-to-cart::AddToCart.select` | apps/web/components/add-to-cart.tsx | `apps/web/components/add-to-cart::AddToCart` | Dropdown select. Handlers: onChange. |
| `apps/web/components/chat-widget::ChatPanel.button` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | Button. labelled "Open support chat". Handlers: onClick. |
| `apps/web/components/chat-widget::ChatPanel.button-2` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | Button. labelled "Close support chat". Handlers: onClick. |
| `apps/web/components/chat-widget::ChatPanel.button-3` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | Button. Handlers: onClick. |
| `apps/web/components/chat-widget::ChatPanel.button-4` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | Button. type=submit, can be disabled, labelled "Send". |
| `apps/web/components/chat-widget::ChatPanel.form` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | Form. Handlers: onSubmit. |
| `apps/web/components/chat-widget::ChatPanel.input` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | Text input field. placeholder "Ask about orders, sizing, returns…". Handlers: onChange. |
| `apps/web/components/chat-widget::ChatPanel.section` | apps/web/components/chat-widget.tsx | `apps/web/components/chat-widget::ChatPanel` | <section> element. labelled "Support chat". |
| `apps/web/components/product-card::ProductCard.link` | apps/web/components/product-card.tsx | `apps/web/components/product-card::ProductCard` | <Link> component. |
| `apps/web/components/site-header::SiteHeader.link` | apps/web/components/site-header.tsx | `apps/web/components/site-header::SiteHeader` | <Link> component. href "/", labelled "GYM". |
| `apps/web/components/site-header::SiteHeader.link-2` | apps/web/components/site-header.tsx | `apps/web/components/site-header::SiteHeader` | <Link> component. href "/products", labelled "Shop". |
| `apps/web/components/site-header::SiteHeader.link-3` | apps/web/components/site-header.tsx | `apps/web/components/site-header::SiteHeader` | <Link> component. href "/products?category=shoes", labelled "Shoes". |
| `apps/web/components/site-header::SiteHeader.link-4` | apps/web/components/site-header.tsx | `apps/web/components/site-header::SiteHeader` | <Link> component. href "/account". |
| `apps/web/components/site-header::SiteHeader.link-5` | apps/web/components/site-header.tsx | `apps/web/components/site-header::SiteHeader` | <Link> component. href "/cart", labelled "Cart". |

## The code on the way to the AI: endpoint handlers and functions that call a model (3)

| identifier | file | description |
| --- | --- | --- |
| `apps/web/app/api/auth/login/route::POST` | apps/web/app/api/auth/login/route.ts | Exported Function 'POST'. Params: request. |
| `apps/web/app/api/auth/me/route::GET` | apps/web/app/api/auth/me/route.ts | Exported Function 'GET'. |
| `apps/web/app/api/auth/register/route::POST` | apps/web/app/api/auth/register/route.ts | Exported Function 'POST'. Params: request. |

## Instructions sent to a model (1)

| identifier | file | description |
| --- | --- | --- |
| `apps/web/components/chat-widget::TOOL_LABELS.get_return_policy` | apps/web/components/chat-widget.tsx | Prompt / instruction constant 'TOOL_LABELS.get_return_policy' (27 chars). |
