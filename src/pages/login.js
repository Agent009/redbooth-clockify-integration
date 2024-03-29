import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios from "axios";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/react";
import PopUpModel from "@/common/PopUpModel";
import { handleApiError } from "@/utils/handleApiError";
import { endPoints } from "@/rest_api/endpoints";
import { messages } from "@/utils/messages";

const { REST_API, HOST_URL } = endPoints;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false); // State variable for loading...
  const [showModal, setShowModal] = useState(false); // State variable for modal visibility
  const [modalMessage, setModalMessage] = useState(""); // State variable for modal message
  const [registeredUsers, setRegisteredUsers] = useState([]);

  useEffect(() => {
    // Fetch registered emails from the backend API
    axios
      .get(`${HOST_URL}${REST_API.Account.RegisteredUser}`)
      .then((response) => {
        setRegisteredUsers(response.data);
      })
      .catch((error) => {
        handleApiError(error);
      });
  }, []);

  const router = useRouter();

  const { data: session } = useSession();
  console.log("login session", session);

  const initialValues = {
    rbUserId: "",
    email: "",
    password: "",
  };

  const validationSchema = Yup.object({
    rbUserId: Yup.string().required(messages.validation.rbUserId),
    email: Yup.string()
      .email(messages.validation.invalidEmail)
      .required(messages.validation.requiredEmail),

    password: Yup.string()
      .required(messages.validation.requiredPassword)
      .min(8, messages.validation.minimumPassword),
  });

  const handleSubmit = async (values) => {
    setIsLoading(true);
    // Check if the email is already registered
    if (!registeredUsers.includes(values.email)) {
      setShowModal(true);
      setModalMessage(messages.validation.unRegisteredEmail);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        rbUserId: values.rbUserId,
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (result.error) {
        setShowModal(true);
        setModalMessage(result.error);
      } else if (result.ok) {
        // Login was successful
        setShowModal(true);
        setModalMessage(messages.showSuccessMessage.loginSuccess);
        router.replace("/dashboard");
      } else {
        // Handle other cases, such as result.unknown, etc.
        setShowModal(true);
        setModalMessage(messages.validation.networkError);
      }
    } catch (error) {
      // Handle unexpected errors or exceptions
      console.error("An error occurred during login:", error);
      setShowModal(true);
      setModalMessage(messages.validation.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => setShowModal(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 shadow-md rounded-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            <div className="mb-4">
              <label htmlFor="rbUserId">RB User ID</label>
              <Field
                type="text"
                id="rbUserId"
                name="rbUserId"
                className="block w-full border rounded py-2 px-3"
              />
              <ErrorMessage
                name="rbUserId"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                id="email"
                name="email"
                className="block w-full border rounded py-2 px-3"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password">Password</label>
              <Field
                type="password"
                id="password"
                name="password"
                className="block w-full border rounded py-2 px-3"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4 flex justify-end item-center">
              {/* forgot password link */}
              <Link href="/forgot-password">
                <span className="text-gray-700 hover:underline cursor-pointer">
                  Forgot Password?
                </span>
              </Link>
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 016 12H2c0 2.981 1.655 5.597 4 6.975V17zm10-5.291a7.962 7.962 0 01-2 5.291v-1.725c1.345-.378 2.3-1.494 2.4-2.766h-2.4zm-8-3.518v1.725c-1.345.378-2.3 1.494-2.4 2.766h2.4A7.962 7.962 0 016 11.709z"
                    ></path>
                  </svg>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </div>
          </Form>
        </Formik>
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-gray-700 hover:underline font-bold"
          >
            Register
          </Link>
        </p>
      </div>
      {showModal && (
        <PopUpModel
          isOpen={showModal}
          closeModal={closeModal}
          title="Registration Status"
          text={modalMessage}
        />
      )}
    </div>
  );
};

export default Login;
