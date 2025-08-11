import { Button } from "@repo/ui/button";
import { Form } from "@repo/ui/form";

export default function Admin(){
    return (<div>
        <h1 className="text-black">Hi</h1>
        <Button appName="adminPage">welcome to admin route</Button>
        <Form/>       
    </div>)
}