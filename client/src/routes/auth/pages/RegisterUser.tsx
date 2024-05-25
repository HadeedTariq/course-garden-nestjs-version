import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  RegisterSchema,
  registerValidator,
} from "../validators/auth.validator";
import { QualificationSelector } from "../components/QualificationSelector";
import { CountrySelector } from "../components/CountrySelector";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ServerError } from "@/types/general";

export default function RegisterUser() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerValidator),
    values: {
      country: "",
      email: "",
      mobileNumber: "",
      password: "",
      qualification: "",
      username: "",
    },
  });
  const { mutate: registerUser, isPending } = useMutation({
    mutationKey: ["registerUser"],
    mutationFn: async (user: RegisterSchema) => {
      const { data } = await authApi.post("/register", user);
      console.log(data);
    },
    onSuccess: () => {
      toast({
        title: "User registered successfully",
      });
      form.reset();
      navigate("/auth/login");
    },
    onError: (err: ServerError) => {
      toast({
        variant: "destructive",
        title: err.response.data.message || "Something went wrong",
        description: err.response.data.description,
      });
    },
  });
  const onSubmit = (user: RegisterSchema) => {
    registerUser(user);
  };
  console.log(form.getValues());
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" grid grid-cols-2 gap-4 px-6 py-5 max-[500px]:grid-cols-1">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qualification"
          render={() => (
            <FormItem>
              <FormLabel>Qualification</FormLabel>
              <QualificationSelector form={form} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={() => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <CountrySelector form={form} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="phoneNumber" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          disabled={isPending || form.formState.disabled}
          type="submit"
          variant={"app"}
          className="text-white">
          Register
        </Button>
      </form>
    </Form>
  );
}
