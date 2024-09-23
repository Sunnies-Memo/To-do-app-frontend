import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { IUploadImg } from "../interface/profie-interface";
import { Spinner } from "@material-tailwind/react";

export interface DropZoneProps {
  hasTempImg?: boolean;
  username: string;
  fileSort: string;
  token: string;
  uploadFn: (data: IUploadImg, token: string) => Promise<any>;
  size: {
    width: string;
    heigth: string;
  };
}

export function ImageDropZone({
  hasTempImg,
  username,
  token,
  uploadFn,
  size,
}: DropZoneProps) {
  const queryClient = useQueryClient();

  const uploadImgMutation = useMutation({
    mutationFn: (data: File) => uploadFn({ username, imgData: data }, token),
    onError: () => {
      // 에러 핸들링
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        files.forEach((file) => {
          uploadImgMutation.mutate(file);
        });
      }
    },
    [uploadImgMutation]
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {uploadImgMutation.isPending ? (
        <Spinner
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
      ) : isDragActive ? (
        <p>Drop your image here!</p>
      ) : (
        <p>Drag or upload your image here!</p>
      )}
    </div>
  );
}
