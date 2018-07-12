const puppeteer = require('puppeteer');

const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    // use static function to build the proxy object !!
    static async build() {
        const broswer = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await broswer.newPage();
        const customPage = new CustomPage(page);

        // CRAZY: use Proxy to encapsulate existing function from puppeteer and custom one
        // And make them become a simple class
        return new Proxy(customPage, {
            get: function(target, property) {
                return (
                    customPage[property] || broswer[property] || page[property]
                );
            }
        });
    }
    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const {session, sig} = sessionFactory(user);

        await this.page.setCookie({name: 'session', value: session});
        await this.page.setCookie({name: 'session.sig', value: sig});
        // force the page to rerender so it will use the newly-set cookie to rerender
        await this.page.goto('http://localhost:3000/blogs');
        // give some delay, so the following test will be run after the render process finished
        await this.page.waitFor('a[href="/auth/logout"]');
        //
    }

    // For clearer function call, not the native puppeteer one
    async getContentsOf(selector) {
        // puppeteer launch chromium in a seperate process and serialize the data
        // That's why this function call looks weird
        // el => el.innerHTML is a function called in chromium
        return this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;
