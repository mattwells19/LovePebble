import { createToaster, Toast, Toaster as ArkToaster } from "@ark-ui/react";
import { RiCloseFill } from "@remixicon/react";
import styles from "../styles/components/Toaster.module.scss";

const toaster = createToaster({
  placement: "top",
  overlap: false,
  gap: 24,
});

export const toast = (options: Parameters<typeof toaster.create>[0]) => toaster.create(options);

export const Toaster = () => {
  return (
    <ArkToaster toaster={toaster}>
      {(toast) => (
        <Toast.Root key={toast.id} className={styles.toast}>
          <Toast.Title>{toast.title}</Toast.Title>
          <Toast.Description>{toast.description}</Toast.Description>
          <Toast.CloseTrigger>
            <RiCloseFill />
          </Toast.CloseTrigger>
        </Toast.Root>
      )}
    </ArkToaster>
  );
};
