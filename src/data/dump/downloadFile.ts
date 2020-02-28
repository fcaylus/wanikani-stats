import axios from "axios";

/**
 * Simply download a file and return the content.
 * No checks are performed since this method is called manually at build time.
 */
export default async (url: string) => {
    return (await axios.get(url, {
        baseURL: ""
    })).data.toString()
}
