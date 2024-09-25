import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Spinner } from "@material-tailwind/react";
import styled from "styled-components";
import { DropZoneProps } from "../interface/profie-interface";

interface IZoneSize {
  size: {
    width: string;
    height: string;
  };
}

const Zone = styled.div<IZoneSize>`
  border: 2px dotted ${(props) => props.theme.dropArea.fromThis};
  height: ${(props) => props.size.height};
  width: ${(props) => props.size.width};
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
  p {
    font-size: 13px;
  }
`;

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
      alert("Fail to upload image.");
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
    <Zone {...getRootProps()} size={size}>
      <input {...getInputProps()} />
      {uploadImgMutation.isPending ? (
        <Spinner
          onPointerEnterCapture={undefined}
          onPointerLeaveCapture={undefined}
        />
      ) : isDragActive ? (
        <p>Drop your image here!</p>
      ) : (
        <>
          <p>Drag here or click</p>
          <p>to upload your image!</p>
        </>
      )}
    </Zone>
  );
}
